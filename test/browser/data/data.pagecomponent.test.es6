/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Validation: cannot change id and tool
// TODO Add image and textbox
// TODO Add a more complex tool with array attribues or properties

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import ObjectId from '../../../src/js/common/window.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import { Page } from '../../../src/js/data/data.page.es6';
import {
    PageComponent,
    PageComponentDataSource
} from '../../../src/js/data/data.pagecomponent.es6';
import { normalizeSchema } from '../../../src/js/data/data.util.es6';
import { assertBaseModel, tryCatch } from '../_misc/test.util.es6';
import { getComponentArray, getPage } from '../_misc/test.components.es6';
import { getSpyingTransport } from '../_misc/test.transports.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, Model }
} = window.kendo;
chai.use(sinonChai);

describe('data.pagecomponent', () => {
    describe('PageComponent', () => {
        describe('Initialization', () => {
            it('It should initialize a PageComponent without options (although there is no tool)', () => {
                // Initialization without parameter is a Kendo UI requirement
                const component = new PageComponent();
                expect(component).to.be.an.instanceof(PageComponent);
                expect(component).to.be.an.instanceof(BaseModel);
                expect(component).to.be.an.instanceof(Model);
                // Test default values
                assertBaseModel(component, component.defaults);
            });

            it('It should throw when initializing a PageComponent with invalid options', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent(JSC.object()());
                }
                expect(test).to.throw(Error);
            });

            it('It should throw when initializing a PageComponent with a POINTER', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: CONSTANTS.POINTER
                    });
                }
                expect(test).to.throw(Error);
            });

            it('It should throw when initializing a PageComponent with an unknown tool', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: JSC.string()()
                    });
                }
                expect(test).to.throw(Error);
            });

            it('It should initialize a PageComponent with a bare tool', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component).to.be.an.instanceof(BaseModel);
                    expect(component).to.be.an.instanceof(Model);
                    // Test default values
                    assertBaseModel(component, {
                        ...component.defaults,
                        attributes: component.attributes.defaults,
                        properties: component.properties.defaults,
                        ...options
                    });
                }
                getComponentArray()
                    .map(item => ({ tool: item.tool }))
                    .forEach(test);
            });

            it('It should initialize a PageComponent with options', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component).to.be.an.instanceof(BaseModel);
                    expect(component).to.be.an.instanceof(Model);
                    const json = component.toJSON();
                    expect(json).to.deep.equal(options);
                }
                getComponentArray().forEach(test);
            });
        });

        describe('Non-editable fields', () => {
            it('It should not modify id', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component.fields[component.idField].editable).to.be
                        .false;
                    component.set(component.idField, JSC.string()());
                    // Modification is simply discarded (no error is thrown)
                    expect(component).to.have.property(
                        component.idField,
                        options.id
                    );
                }
                getComponentArray().forEach(test);
            });

            it('It should not modify tool', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    expect(component.fields.tool.editable).to.be.false;
                    component.set('tool', JSC.string()());
                    // Modification is simply discarded (no error is thrown)
                    expect(component).to.have.property('tool', options.tool);
                }
                getComponentArray().forEach(test);
            });
        });

        describe('assets', () => {
            it('It should list assets', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const assets = component.assets();
                    expect(assets)
                        .to.have.property('audio')
                        .that.is.an(CONSTANTS.ARRAY);
                    expect(assets)
                        .to.have.property('image')
                        .that.is.an(CONSTANTS.ARRAY);
                    expect(assets)
                        .to.have.property('video')
                        .that.is.an(CONSTANTS.ARRAY);
                    // TODO: how do we ensure these have the correct list?
                }
                getComponentArray().forEach(test);
            });
        });

        describe('page', () => {
            it('It should return undefined without parent page', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const page = component.page();
                    expect(page).to.be.undefined;
                }
                getComponentArray().forEach(test);
            });

            xit('It should return the parent page otherwise', () => {
                const options = getPage();
                const page = new Page(options);
                options.components.forEach((item, index) => {
                    const component = page.components.at(index);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component.page === page).to.be.true;
                });
            });
        });

        describe('index', () => {
            it('It should return undefined without parent data source', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const index = component.index();
                    expect(index).to.be.undefined;
                }
                getComponentArray().forEach(test);
            });

            xit('It should return an index otherwise', () => {
                const options = getPage();
                const page = new Page(options);
                options.components.forEach((item, index) => {
                    const component = page.components.at(index);
                    expect(component).to.be.an.instanceof(PageComponent);
                    expect(component.page === page).to.be.true;
                });
            });
        });

        describe('description$', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('help$', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('clone', () => {
            it('It should clone any component', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const json = component.toJSON();
                    const clone = component.clone();
                    expect(clone).to.be.an.instanceof(PageComponent);
                    expect(clone).to.be.an.instanceof(BaseModel);
                    expect(clone).to.be.an.instanceof(Model);
                    const result = clone.toJSON();
                    // Cloned component has no id
                    delete json.id;
                    // Components with name and validation are modified
                    if (
                        result.properties.name &&
                        result.properties.validation
                    ) {
                        // Cloned component has a different name
                        delete json.properties.name;
                        delete result.properties.name;
                        // Clone component should have these values
                        json.properties.failure = 0;
                        json.properties.omit = 0;
                        json.properties.question = '';
                        json.properties.solution = '';
                        json.properties.success = 1;
                        // json.properties.validation = '// equal';
                    }
                    // Compare
                    expect(result).to.deep.equal(json);
                }
                getComponentArray().forEach(test);
            });
        });

        describe('Validation', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('toJSON', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('Events', () => {
            it('It should propagate change events from attributes', () => {
                function test(options) {
                    const change = sinon.spy();
                    const component = new PageComponent(options);
                    component.bind('change', change);
                    component.attributes.set('text', JSC.string()());
                    expect(change).to.have.been.calledOnce;
                }
                getComponentArray().forEach(test);
            });

            it('It should propagate change events from properties', () => {
                function test(options) {
                    const change = sinon.spy();
                    const component = new PageComponent(options);
                    component.bind('change', change);
                    component.properties.set('constant', JSC.string()());
                    expect(change).to.have.been.calledOnce;
                }
                getComponentArray().forEach(test);
            });
        });
    });

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
                const data = getComponentArray();
                const promises = data.map(item => test({ tool: item.tool }));
                $.when(...promises)
                    .then(
                        tryCatch(done)((...results) => {
                            results.forEach(res => {
                                expect(res.dataSource.total()).to.equal(1);
                                const component = res.dataSource.at(0);
                                assertBaseModel(
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
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({ data });
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
                            expect(dataSource.total()).to.equal(data.length);
                            data.forEach((options, index) => {
                                const component = dataSource.at(index);
                                assertBaseModel(component, options);
                            });
                        })
                    )
                    .catch(done);
            });

            it('it should initialize from a transport', done => {
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({
                    schema: normalizeSchema(),
                    transport: getSpyingTransport(data)
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
                            expect(dataSource.total()).to.equal(data.length);
                            data.forEach((options, index) => {
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
                const data = getComponentArray();
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
                            data.forEach(test);
                        })
                    )
                    .catch(done);
            });

            it('It should insert components', done => {
                const data = getComponentArray();
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
                            data.forEach(test);
                        })
                    )
                    .catch(done);
            });

            /*
            xit('WARNING! It fails to handle duplicate ids', done => {
                // This test is completed but fails to prove that kendo.data.DataSource handles duplicate ids
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({ data });
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
                            data.forEach(test);
                        })
                    )
                    .catch(done);
            });
            */

            xit('If dataSource initialized from transport, it should only call create', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({
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
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource.read().then(() => {
                    expect(dataSource.total()).to.equal(data.length);
                    dataSource.add(new PageComponent({ tool: 'label' }));
                    expect(dataSource.at(data.length).isNew()).to.be.true;
                    expect(dataSource.total()).to.equal(data.length + 1);
                    dataSource.sync().always(() => {
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
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({ data });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource.read().then(() => {
                    dataSource.at(0).set('top', 111);
                    expect(dataSource.at(0).dirty).to.be.true;
                    expect(dataSource.total()).to.equal(data.length);
                    done();
                });
            });

            xit('If dataSource initialized from transport, it should only call update', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({
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
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource.read().then(() => {
                    dataSource.at(0).set('top', 111);
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
            xit('If dataSource initialized from in-memory array, there should be one page component less', done => {
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({ data });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource.read().then(() => {
                    expect(dataSource.total()).to.equal(data.length);
                    dataSource.remove(dataSource.at(0));
                    expect(dataSource.total()).to.equal(data.length - 1);
                    done();
                });
            });

            xit('If dataSource initialized from transport, it should only call destroy', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getComponentArray();
                const pageComponentCollectionDataSource = new PageComponentDataSource(
                    {
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
                    }
                );
                expect(pageComponentCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new pageComponentCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                pageComponentCollectionDataSource.read().then(() => {
                    expect(pageComponentCollectionDataSource.total()).to.equal(
                        data.length
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
                const data = getComponentArray();
                const dataSource = new PageComponentDataSource({ data });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource.read().then(() => {
                    expect(dataSource)
                        .to.have.property('toJSON')
                        .that.is.a('function');
                    const json = dataSource.toJSON();
                    // Note: deep.equal of both arrays does not work
                    expect(json)
                        .to.be.an.instanceof(Array)
                        .with.property('length', data.length);
                    for (let i = 0; i < json.length; i++) {
                        expect(json[i].attributes.alt).to.equal(
                            data[i].attributes.alt
                        );
                        // expect(json[i].attributes.dirty).to.equal(data[i].attributes.dirty);
                        expect(json[i].attributes.src).to.equal(
                            data[i].attributes.src
                        );
                        expect(json[i].height).to.equal(data[i].height);
                        expect(json[i].id).to.equal(data[i].id);
                        expect(json[i].left).to.equal(data[i].left);
                        // expect(json[i].properties.dirty).to.equal(data[i].properties.dirty);
                        expect(json[i].rotate).to.equal(data[i].rotate);
                        // expect(json[i].tag).to.equal(data[i].tag);
                        expect(json[i].tool).to.equal(data[i].tool);
                        expect(json[i].top).to.equal(data[i].top);
                        expect(json[i].width).to.equal(data[i].width);
                    }
                    done();
                });
            });
        });
    });

    xdescribe('PageComponentDataSource.create', () => {
        it('if initialized from a kendo.data.DataSource that is not a kendo.PageComponentDataSource, it should throw', () => {
            function fn() {
                // const dataSource = PageComponentDataSource.create(
                PageComponentDataSource.create(new DataSource({ data: [] }));
            }
            expect(fn).to.throw(Error);
        });

        xit('if initialized from a PageComponentDataSource, the number of components should match', done => {
            const data = getComponentArray();
            const dataSource1 = PageComponentDataSource.create(data);
            const dataSource2 = PageComponentDataSource.create(dataSource1);
            expect(dataSource1)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(dataSource2)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            // eslint-disable-next-line new-cap
            expect(new dataSource1.options.schema.model()).to.be.an.instanceof(
                PageComponent
            );
            // eslint-disable-next-line new-cap
            expect(new dataSource2.options.schema.model()).to.be.an.instanceof(
                PageComponent
            );
            $.when(dataSource1.read(), dataSource2.read()).then(() => {
                expect(dataSource1.total()).to.equal(data.length);
                expect(dataSource2.total()).to.equal(data.length);
                done();
            });
        });

        xit('if initialized from a transport, the number of components should match', done => {
            const data = getComponentArray();
            const dataSource1 = PageComponentDataSource.create(data);
            const dataSource2 = new PageComponentDataSource({
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
            // eslint-disable-next-line new-cap
            expect(new dataSource1.options.schema.model()).to.be.an.instanceof(
                PageComponent
            );
            // eslint-disable-next-line new-cap
            expect(new dataSource2.options.schema.model()).to.be.an.instanceof(
                PageComponent
            );
            $.when(dataSource1.read(), dataSource2.read()).then(() => {
                expect(dataSource1.total()).to.equal(data.length);
                expect(dataSource2.total()).to.equal(data.length);
                done();
            });
        });

        xit('It should create from an array', () => {});

        xit('It should create from an ObservableArray', () => {});

        xit('It should create from a PageComponentDataSource', () => {});
    });
});
