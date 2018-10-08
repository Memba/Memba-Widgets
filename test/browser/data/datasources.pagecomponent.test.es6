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
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import PageComponentDataSource from '../../../src/js/data/datasources.pagecomponent.es6';
import BaseModel from '../../../src/js/data/models.base.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';

// Load tools
// import '../../../src/js/tools/tools.image.es6';
import '../../../src/js/tools/tools.label.es6';
// import '../../../src/js/tools/tools.textbox.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    Class,
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

/*
const IMAGE = {
    attributes: {
        src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png',
        alt: 'Google Logo'
    },
    height: 250,
    id: new ObjectId().toString(),
    left: 100,
    rotate: 45,
    tool : 'image',
    top: 50,
    width: 250
};
*/

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

/*
const TEXTBOX = {
    attributes: {},
    height: 100,
    id: new ObjectId().toString(),
    left: 20,
    properties: {
        name: 'textfield3'
    },
    rotate: 0,
    tool : 'textbox',
    top: 20,
    width: 300
};
*/

const DATA = [
    // IMAGE,
    LABEL // ,
    // TEXTBOX
];

function assertModel(actual, expected) {
    expect(actual).to.be.an.instanceof(BaseModel);
    Object.keys(actual.fields).forEach(key => {
        if (
            actual[key] === null ||
            [
                CONSTANTS.BOOLEAN,
                CONSTANTS.DATE,
                CONSTANTS.NUMBER,
                CONSTANTS.STRING
            ].indexOf(actual.fields[key].type) > -1
        ) {
            expect(actual).to.have.property(key, expected[key]);
        } else {
            assertModel(actual[key], (expected || {})[key]);
        }
    });
}

const BasicTransport = Class.extend({
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

describe('datasources.pagecomponent', () => {
    describe('PageComponentDataSource', () => {
        describe('Initialization', () => {
            it('It should initialize without options', done => {
                const dataSource = new PageComponentDataSource();
                expect(dataSource).to.be.an.instanceof(PageComponentDataSource);
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

            it('It should initialize from an empty array', done => {
                const dataSource = new PageComponentDataSource({ data: [] });
                expect(dataSource).to.be.an.instanceof(PageComponentDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
                dataSource
                    .read()
                    .then(() => {
                        expect(dataSource.total()).to.equal(0);
                        done();
                    })
                    .catch(done);
            });

            it('It should throw when initializing from a dummy array', () => {
                function test() {
                    const dataSource = new PageComponentDataSource({
                        data: JSC.array(JSC.integer(5), JSC.object())()
                    });
                    dataSource.read();
                }
                expect(test).to.throw(Error);
            });

            it('It should throw if initialized with a dummy model', () => {
                const Book = BaseModel.define({
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
                    {
                        id: new ObjectId().toString(),
                        title: 'Gone with the wind'
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'OK Coral'
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'The third man'
                    },
                    {
                        id: new ObjectId().toString(),
                        title: 'The guns of Navarone'
                    }
                ];
                function test() {
                    const dataSource = new PageComponentDataSource({
                        data: books,
                        schema: {
                            model: Book,
                            modelBase: Book
                        }
                    });
                    dataSource.read();
                }
                expect(test).to.throw(Error);
            });

            it('It should initialize from an array with a bare component', done => {
                function test(options) {
                    const dfd = $.Deferred();
                    const dataSource = new PageComponentDataSource({
                        data: [options]
                    });
                    expect(dataSource).to.be.an.instanceof(
                        PageComponentDataSource
                    );
                    expect(dataSource).to.be.an.instanceof(DataSource);
                    dataSource
                        .read()
                        .then(() => {
                            dfd.resolve({ dataSource, options });
                        })
                        .catch(dfd.reject);
                    return dfd.promise();
                }
                const promises = DATA.map(item => test({ tool: item.tool }));
                $.when(...promises)
                    .then(
                        tryCatch(done)((...results) => {
                            results.forEach(res => {
                                expect(res.dataSource.total()).to.equal(1);
                                const component = res.dataSource.at(0);
                                assertModel(
                                    component,
                                    $.extend(
                                        {},
                                        component.defaults,
                                        res.options,
                                        {
                                            attributes:
                                                component.attributes.defaults,
                                            properties:
                                                component.properties.defaults
                                        }
                                    )
                                );
                            });
                        })
                    )
                    .catch(done);
            });

            it('it should initialize from an array of components', done => {
                const dataSource = new PageComponentDataSource({ data: DATA });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource.total()).to.equal(DATA.length);
                            DATA.forEach((options, index) => {
                                const component = dataSource.at(index);
                                assertBaseModel(component, options);
                            });
                        })
                    )
                    .catch(done);
            });

            it('it should initialize from a transport', done => {
                const dataSource = new PageComponentDataSource({
                    schema: {
                        data(res) {
                            return res &&
                                Array.isArray(res.data) &&
                                $.type(res.total) === CONSTANTS.NUMBER
                                ? res.data
                                : res;
                        },
                        errors: 'error',
                        total: 'total'
                    },
                    transport: new BasicTransport()
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource.total()).to.equal(DATA.length);
                            DATA.forEach((options, index) => {
                                const component = dataSource.at(index);
                                assertBaseModel(component, options);
                            });
                        })
                    )
                    .catch(done);
            });
        });

        describe('Adding and inserting', () => {
            it('It should add components', done => {
                const dataSource = new PageComponentDataSource();
                function test(options) {
                    const total = dataSource.total();
                    dataSource.add(options);
                    expect(dataSource.total()).to.equal(total + 1);
                    const component = dataSource.at(total);
                    assertBaseModel(component, options);
                }
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            DATA.forEach(test);
                        })
                    )
                    .catch(done);
            });

            it('It should insert components', done => {
                const dataSource = new PageComponentDataSource();
                function test(options) {
                    const total = dataSource.total();
                    dataSource.insert(0, options);
                    expect(dataSource.total()).to.equal(total + 1);
                    const component = dataSource.at(0);
                    assertBaseModel(component, options);
                }
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            DATA.forEach(test);
                        })
                    )
                    .catch(done);
            });

            /*
            xit('WARNING! It fails to handle duplicate ids', done => {
                // This test is completed but fails to prove that kendo.data.DataSource handles duplicate ids
                const dataSource = new PageComponentDataSource({ data: DATA });
                function test(options) {
                    const total = dataSource.total();
                    dataSource.add(options);
                    expect(dataSource.total()).to.equal(total + 1);
                    const component = dataSource.at(total);
                    assertBaseModel(component, options);
                }
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            DATA.forEach(test);
                        })
                    )
                    .catch(done);
            });
            */

            xit('If dataSource initialized from transport, it should only call create', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    {
                        transport: {
                            read(options) {
                                options.success(DATA);
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
                        DATA.length
                    );
                    pageComponentCollectionDataSource.add(
                        new PageComponent({ tool: 'label' })
                    );
                    expect(
                        pageComponentCollectionDataSource
                            .at(DATA.length)
                            .isNew()
                    ).to.be.true;
                    expect(pageComponentCollectionDataSource.total()).to.equal(
                        DATA.length + 1
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

        describe('Updating', () => {
            xit('If dataSource initialized from in-memory array, there should be one updated page component', done => {
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    { data: DATA }
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
                        DATA.length
                    );
                    done();
                });
            });

            xit('If dataSource initialized from transport, it should only call update', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    {
                        transport: {
                            read(options) {
                                options.success(DATA);
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
                        DATA.length
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

        describe('Removing', () => {
            xit('If dataSource initialized from in-memory array, there should be one page component less', done => {
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    { data: DATA }
                );
                expect(pageComponentCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageComponentCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(() => {
                    expect(pageComponentCollectionDataSource.total()).to.equal(
                        DATA.length
                    );
                    pageComponentCollectionDataSource.remove(
                        pageComponentCollectionDataSource.at(0)
                    );
                    expect(pageComponentCollectionDataSource.total()).to.equal(
                        DATA.length - 1
                    );
                    done();
                });
            });

            xit('If dataSource initialized from transport, it should only call destroy', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    {
                        transport: {
                            read(options) {
                                options.success(DATA);
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
                        DATA.length
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

        // TODO filtering, aggregating and grouping

        describe('Events', () => {
            xit('It should...', () => {});
        });

        describe('Errors', () => {
            xit('It should...', () => {});
        });

        describe('toJSON', () => {
            xit('it should implement toJSON', done => {
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    { data: DATA }
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
                        .with.property('length', DATA.length);
                    for (
                        let i = 0;
                        i < pageComponentCollectionJSON.length;
                        i++
                    ) {
                        expect(
                            pageComponentCollectionJSON[i].attributes.alt
                        ).to.equal(DATA[i].attributes.alt);
                        // expect(pageComponentCollectionJSON[i].attributes.dirty).to.equal(DATA[i].attributes.dirty);
                        expect(
                            pageComponentCollectionJSON[i].attributes.src
                        ).to.equal(DATA[i].attributes.src);
                        expect(pageComponentCollectionJSON[i].height).to.equal(
                            DATA[i].height
                        );
                        expect(pageComponentCollectionJSON[i].id).to.equal(
                            DATA[i].id
                        );
                        expect(pageComponentCollectionJSON[i].left).to.equal(
                            DATA[i].left
                        );
                        // expect(pageComponentCollectionJSON[i].properties.dirty).to.equal(DATA[i].properties.dirty);
                        expect(pageComponentCollectionJSON[i].rotate).to.equal(
                            DATA[i].rotate
                        );
                        // expect(pageComponentCollectionJSON[i].tag).to.equal(DATA[i].tag);
                        expect(pageComponentCollectionJSON[i].tool).to.equal(
                            DATA[i].tool
                        );
                        expect(pageComponentCollectionJSON[i].top).to.equal(
                            DATA[i].top
                        );
                        expect(pageComponentCollectionJSON[i].width).to.equal(
                            DATA[i].width
                        );
                    }
                    done();
                });
            });
        });
    });

    describe('PageComponentDataSource.create', () => {
        it('if initialized from a kendo.data.DataSource that is not a kendo.PageComponentDataSource, it should throw', () => {
            const testFn = function() {
                const dataSource = PageComponentDataSource.create(
                    new kendo.data.DataSource({ data: [] })
                );
            };
            expect(testFn).to.throw(Error);
        });

        xit('if initialized from a PageComponentDataSource, the number of components should match', done => {
            const pageComponentCollectionDataSource1 = PageComponentDataSource.create(
                DATA
            );
            const pageComponentCollectionDataSource2 = PageComponentDataSource.create(
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
                    DATA.length
                );
                expect(pageComponentCollectionDataSource2.total()).to.equal(
                    DATA.length
                );
                done();
            });
        });

        xit('if initialized from a transport, the number of components should match', done => {
            const pageComponentCollectionDataSource1 = PageComponentDataSource.create(
                DATA
            );
            const pageComponentCollectionDataSource2 = new PageComponentDataSource(
                {
                    transport: {
                        read(options) {
                            options.success(DATA);
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
                    DATA.length
                );
                expect(pageComponentCollectionDataSource2.total()).to.equal(
                    DATA.length
                );
                done();
            });
        });

        xit('It should create from an array', () => {});

        xit('It should create from an ObservableArray', () => {});

        xit('It should create from a PageComponentDataSource', () => {});
    });
});
