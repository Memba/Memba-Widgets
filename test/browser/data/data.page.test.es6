/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import { assertBaseModel, baseUrl, tryCatch } from '../_misc/test.util.es6';
import {
    getComponentArray,
    getPage,
    getPageArray
} from '../_misc/test.components.es6';
import ObjectId from '../../../src/js/common/window.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { Page, PageDataSource } from '../../../src/js/data/data.page.es6';
import { PageComponentDataSource } from '../../../src/js/data/data.pagecomponent.es6';
// import Stream from '../../../src/js/data/data.stream.es6';
// import { normalizeSchema } from '../../../src/js/data/data.util.es6';
import {
    getErrorTransport
    // getSpyingTransport
} from '../_misc/test.transports.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, Model }
} = window.kendo;
chai.use(sinonChai);

describe('data.page', () => {
    describe('Page', () => {
        describe('Initialization', () => {
            it('It should initialize without options', done => {
                // Unfortunately, this is a Kendo UI requirement
                const page = new Page();
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(components.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('It should throw when initializing with invalid components', () => {
                const options = {
                    components: [JSC.object()()]
                };
                const page = new Page(options);
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(components.fetch).to.throw();
                expect(components.read).to.throw();
                // page.load is undefined
                // expect(page.load).not.to.throw();
            });

            it('It should initialize from a dummy object', done => {
                const options = JSC.object()();
                const prop = Object.keys(options)[0];
                const page = new Page(options);
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(page[prop]).to.be.undefined;
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(components.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('if should initialize with bare components', done => {
                const data = getComponentArray();
                const options = {
                    components: data.map(item => ({
                        tool: item.tool
                    }))
                };
                const page = new Page(options);
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(components).to.respondTo('fetch');
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(components.total()).to.equal(data.length);
                            components.data().forEach((component, index) => {
                                assertBaseModel(component, {
                                    ...component.defaults,
                                    attributes: component.attributes.defaults,
                                    properties: component.properties.defaults,
                                    ...options.components[index]
                                });
                            });
                        })
                    )
                    .catch(done);
            });

            it('if should initialize with all data', done => {
                const options = getPage();
                const page = new Page(options);
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id');
                expect(page).to.have.property('explanations');
                expect(page).to.have.property('instructions');
                expect(page).to.have.property('style');
                expect(page).to.have.property('time');
                expect(components).to.respondTo('fetch');
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(components.total()).to.equal(
                                options.components.length
                            );
                            components.data().forEach((component, index) => {
                                assertBaseModel(
                                    component,
                                    options.components[index]
                                );
                            });
                        })
                    )
                    .catch(done);
            });
        });

        describe('Non-editable fields', () => {
            it('It should not modify id', () => {
                const options = getPage();
                const page = new Page(options);
                expect(page.fields[page.idField].editable).to.be.false;
                page.set(page.idField, JSC.string()());
                // Modification is simply discarded (no error is thrown)
                expect(page).to.have.property(page.idField, options.id);
            });
        });

        /*
        describe('append', () => {
            it('...', () => {});
        });

        describe('load', () => {
            it('...', () => {});
        });

        describe('loaded', () => {
            it('...', () => {});
        });
        */

        describe('assets', () => {
            it('It should list assets', done => {
                const options = getPage();
                const page = new Page(options);
                page.components
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            const assets = page.assets();
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
                        })
                    )
                    .catch(done);
            });
        });

        xdescribe('pages.components.parent', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('stream', () => {
            xit('it should return the parent stream', () => {
                expect(true).to.be.false;
            });
        });

        xdescribe('index', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        xdescribe('clone', () => {
            it('It should clone any page', done => {
                const options = getPage();
                const page = new Page(options);
                const { components } = page;
                expect(components).to.be.an.instanceof(PageComponentDataSource);
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            assertBaseModel(page, options);
                            const clone = page.clone();
                            // Clean options
                            options.id = null;
                            options.components.forEach((component, index) => {
                                /* eslint-disable no-param-reassign */
                                const model = clone.components.at(index);
                                component[model.idField] =
                                    model.defaults[model.idField];
                                if (model.properties.defaults.name) {
                                    component.properties.failure =
                                        model.properties.defaults.failure;
                                    component.properties.name =
                                        model.properties.defaults.name;
                                    component.properties.omit =
                                        model.properties.defaults.omit;
                                    component.properties.question =
                                        model.properties.defaults.question;
                                    component.properties.solution =
                                        model.properties.defaults.solution;
                                    component.properties.success =
                                        model.properties.defaults.success;
                                    component.properties.omit =
                                        model.properties.defaults.omit;
                                }
                                /* eslint-enable no-param-reassign */
                            });
                            assertBaseModel(clone, options);
                        })
                    )
                    .catch(done);
            });
        });

        xdescribe('Validation', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        xdescribe('toJSON', () => {
            it('It should save to JSON', () => {
                expect(true).to.be.false;
                // TODO: test default values are undefined
            });
        });

        describe('Events', () => {
            xit('It should propagate CHANGE events when updating components', done => {
                const options = getPage();
                const page = new Page(options);
                const { components } = page;
                const pageChange = sinon.spy();
                const componentsChange = sinon.spy();
                page.bind(CONSTANTS.CHANGE, e => {
                    pageChange(e);
                });
                components.bind(CONSTANTS.CHANGE, e => {
                    componentsChange(e);
                });
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            let hasLabel = false;
                            components.data().forEach(component => {
                                if (component.get('tool') === 'label') {
                                    component.attributes.set(
                                        'text',
                                        JSC.string()()
                                    );
                                    hasLabel = true;
                                }
                            });
                            if (hasLabel) {
                                // Called once when fetch
                                // Called twice when attributes.set
                                expect(pageChange).to.have.been.calledTwice;
                                expect(componentsChange).to.have.been
                                    .calledTwice;
                            } else {
                                // Called once when fetch
                                expect(pageChange).to.have.been.calledOnce;
                                expect(componentsChange).to.have.been
                                    .calledOnce;
                            }
                        })
                    )
                    .catch(done);
            });

            xit('It should propagate CHANGE events when adding/inserting components', done => {
                const options = getPage();
                const page = new Page(options);
                const { components } = page;
                const pageChange = sinon.spy();
                const componentsChange = sinon.spy();
                page.bind(CONSTANTS.CHANGE, e => {
                    // debugger;
                    pageChange(e);
                });
                components.bind(CONSTANTS.CHANGE, e => {
                    // debugger;
                    componentsChange(e);
                });
                components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            const component = getComponentArray()[0];
                            components.add(component);
                            // Called once when fetch
                            // Called twice when attributes.set
                            expect(pageChange).to.have.been.calledTwice;
                            expect(componentsChange).to.have.been.calledTwice;
                        })
                    )
                    .catch(done);
            });

            xit('It should propagate ERROR events from data source to page', () => {
                const PageWithModel = Page.define({
                    model: {
                        components: {
                            transport: getErrorTransport()
                        }
                    }
                });
                const options = getPage();
                const page = new PageWithModel(options);
                const { components } = page;
                const pageError = sinon.spy();
                const componentsError = sinon.spy();
                page.bind(CONSTANTS.ERROR, e => {
                    // debugger;
                    pageError(e);
                });
                components.bind(CONSTANTS.ERROR, e => {
                    // debugger;
                    componentsError(e);
                });
                page.components.fetch();
                expect(pageError).to.have.been.calledOnce;
                expect(componentsError).to.have.been.calledOnce;
            });
        });
    });

    describe('Page.createTextBoxPage', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('Page.createQuizPage', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('Page.createMultiQuizPage', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

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
                        PageComponentDataSource
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
                    // eslint-disable-next-line new-cap
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
                function fn() {
                    // const dataSource = PageDataSource.create(
                    PageDataSource.create(new DataSource({ data: [] }));
                }
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
                            url: baseUrl('/test/data/pageCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
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
                    for (let i = 0; i < dataSource.total(); i++) {
                        const page = dataSource.at(i);
                        expect(page).to.be.an.instanceof(Page);
                        expect(page.components).to.be.an.instanceof(
                            PageComponentDataSource
                        );
                        expect(page.components.total()).to.equal(0);
                        /*
                        // page.load does not exist anymore
                        const promise = page.load().then(() => {
                            expect(page.components.total()).to.equal(
                                data[i].components.length
                            );
                        });
                        promises.push(promise);
                        */
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
                    // eslint-disable-next-line new-cap
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
                    // eslint-disable-next-line new-cap
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
                    // eslint-disable-next-line new-cap
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
                    // eslint-disable-next-line new-cap
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
                    // eslint-disable-next-line new-cap
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
                    // eslint-disable-next-line new-cap
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
