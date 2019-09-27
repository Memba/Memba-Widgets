/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import ObjectId from '../../../src/js/common/window.objectid.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import { Page, PageDataSource } from '../../../src/js/data/data.page.es6';
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import Stream from '../../../src/js/data/data.stream.es6';
import { normalizeSchema } from '../../../src/js/data/data.util.es6';
import tools from '../../../src/js/tools/tools.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import { assertBaseModel, tryCatch } from '../_misc/test.util.es6';
import { getStream, getComponentArray } from '../_misc/test.components.es6';
import { getSpyingTransport } from '../_misc/test.transports.es6';

const { describe, it, xit } = window;
const { observable, stringify } = window.kendo;
const { expect } = chai;
chai.use(sinonChai);

function loadStream() {
    const dfd = $.Deferred();
    const options = getStream();
    const stream = new Stream(options);
    const { pages } = stream;
    pages
        .fetch()
        .then(() => {
            const promises = pages.data().map(page => page.components.fetch());
            $.when(...promises)
                .then(() => {
                    dfd.resolve(stream);
                })
                .catch(dfd.reject);
        })
        .catch(dfd.reject);
    return dfd.promise();
}

describe('data.stream', () => {
    before(done => {
        const promises = ['image', 'label', 'textbox'].map(tool =>
            tools.load(tool)
        );
        $.when(...promises)
            .then(done)
            .catch(done);
    });

    describe('Stream', () => {
        describe('Initialization', () => {
            it('it should initialize without options', done => {
                // Unfortunately, this is a Kendo UI requirement
                const stream = new Stream();
                const { pages } = stream;
                expect(pages).to.be.an.instanceof(PageDataSource);
                // Only the pages property
                expect(Object.keys(stream.fields)).to.have.lengthOf(1);
                pages
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(pages.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('It should initialize from a dummy object', done => {
                const options = JSC.object()();
                const prop = Object.keys(options)[0];
                const stream = new Stream(options);
                const { pages } = stream;
                expect(pages).to.be.an.instanceof(PageDataSource);
                // Only the pages property
                expect(Object.keys(stream.fields)).to.have.lengthOf(1);
                expect(stream[prop]).to.be.undefined;
                pages
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(pages.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('if should initialize with bare pages and components', done => {
                const options = {
                    pages: [
                        {
                            components: getComponentArray().map(item => ({
                                tool: item.tool
                            }))
                        }
                    ]
                };
                const stream = new Stream(options);
                const { pages } = stream;
                expect(pages).to.be.an.instanceof(PageDataSource);
                // Only the pages property
                expect(Object.keys(stream.fields)).to.have.lengthOf(1);
                pages
                    .fetch()
                    .then(() => {
                        const promises = pages
                            .data()
                            .map(page => page.components.fetch());
                        $.when(...promises)
                            .then(
                                tryCatch(done)(() => {
                                    expect(pages.total()).to.equal(
                                        options.pages.length
                                    );
                                    pages.data().forEach((page, index) => {
                                        expect(
                                            page.components.total()
                                        ).to.equal(
                                            options.pages[index].components
                                                .length
                                        );
                                        /*
                                        // This would require merging with default properties
                                        assertBaseModel(
                                            page,
                                            options.pages[index]
                                        );
                                        */
                                    });
                                })
                            )
                            .catch(done);
                    })
                    .catch(done);
            });

            it('if should initialize with all data', done => {
                const options = getStream();
                const stream = new Stream(options);
                const { pages } = stream;
                expect(pages).to.be.an.instanceof(PageDataSource);
                expect(Object.keys(stream.fields)).to.have.lengthOf(1);
                pages
                    .fetch()
                    .then(() => {
                        const promises = pages
                            .data()
                            .map(page => page.components.fetch());
                        $.when(...promises)
                            .then(
                                tryCatch(done)(() => {
                                    expect(pages.total()).to.equal(
                                        options.pages.length
                                    );
                                    pages.data().forEach((page, index) => {
                                        assertBaseModel(
                                            page,
                                            options.pages[index]
                                        );
                                    });
                                })
                            )
                            .catch(done);
                    })
                    .catch(done);
            });
        });

        /*
        describe('Non-editable fields', () => {
            it('...', () => {});
        });

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
                loadStream()
                    .then(
                        tryCatch(done)(stream => {
                            // TODO find a way to predict the size ????
                            const assets = stream.assets();
                            expect(assets.audio).to.be.an(CONSTANTS.ARRAY);
                            expect(assets.image)
                                .to.be.an(CONSTANTS.ARRAY)
                                .with.property('length')
                                .gt(0);
                            expect(assets.audio).to.be.an(CONSTANTS.ARRAY);
                        })
                    )
                    .catch(done);
            });
        });

        describe('preload', () => {
            xit('TODO', done => {
                expect(true).to.be.false;
                done();
            });
        });

        describe('time', () => {
            it('It should compute the sum of page times', done => {
                loadStream()
                    .then(
                        tryCatch(done)(stream => {
                            const time = stream.time();
                            let sum = 0;
                            stream.pages.data().forEach(p => {
                                sum += p.get('time');
                            });
                            expect(time).to.equal(sum);
                        })
                    )
                    .catch(done);
            });
        });

        describe('getTestModel', () => {
            it('It should build a test model for play mode', done => {
                loadStream()
                    .then(
                        tryCatch(done)(stream => {
                            const TestModel = stream.getTestModel();
                            const model = new TestModel();
                            expect(model).to.be.an.instanceof(BaseModel);
                            stream.pages.data().forEach(page => {
                                page.components.data().forEach(component => {
                                    const name = component.get(
                                        'properties.name'
                                    );
                                    if (TOOLS.RX_TEST_FIELD_NAME.test(name)) {
                                        expect(
                                            TestModel.fields
                                        ).to.have.property(name);
                                        expect(model).to.have.property(name);
                                    }
                                });
                            });
                        })
                    )
                    .catch(done);
            });
        });

        describe('page.stream()', () => {
            it('It should return the parent stream', done => {
                loadStream()
                    .then(
                        tryCatch(done)(stream => {
                            stream.pages.data().forEach(page => {
                                expect(page.stream()).to.equal(stream);
                            });
                        })
                    )
                    .catch(done);
            });
        });

        describe('toJSON', () => {
            it('It should return all pages and components', done => {
                const options = getStream();
                const pageDefaults = new Page().defaults;
                const componentDefaults = new PageComponent().defaults;
                const defaults = {
                    pages: [
                        $.extend(true, {}, pageDefaults, {
                            id: null,
                            components: [
                                $.extend(true, {}, componentDefaults),
                                $.extend({}, componentDefaults)
                            ]
                        }),
                        $.extend(true, {}, pageDefaults, {
                            id: null,
                            components: [
                                $.extend(true, {}, componentDefaults),
                                $.extend({}, componentDefaults)
                            ]
                        })
                    ]
                };
                const stream = new Stream(options);

                stream.pages.read();
                for (let i = 0; i < stream.pages.total(); i++) {
                    stream.pages.at(i).components.read();
                }

                const json = $.extend(true, {}, defaults, options);
                /*
                for (var j = 0; j < json.pages.length; j++) {
                    for (var k = 0; k < json.pages[j].components.length; k++) {
                        // By default properties === {}, which is discarded by toJSON
                        delete json.pages[j].components[k].properties;
                    }
                }
                */
                expect(stream.toJSON(true)).to.deep.equal(json);
                done();
            });
        });

        describe('validation', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });
    });

    /** *******************************************************************************************************
     * Synchronization with sinonJS
     *
     * TODO: especially consider the position of pages and components in arrays, including changing positions
     * http://docs.mongodb.org/manual/reference/operator/update/position/
     *
     ******************************************************************************************************** */

    describe('In memory arrays', () => {
        const storageKey = 'stream';
        let stream;
        const options = {
            pages: [
                {
                    id: new ObjectId().toString(),
                    style: `background-color: #${Math.random()
                        .toString(16)
                        .substr(2, 6)};`,
                    components: [
                        {
                            id: new ObjectId().toString(),
                            tool: 'label',
                            attributes: {
                                text: 'What is this logo?',
                                style: 'font-family: Georgia, serif;'
                            },
                            properties: {}
                        },
                        {
                            id: new ObjectId().toString(),
                            tool: 'image',
                            attributes: {
                                src: 'http://www.google.com/logo.png',
                                alt: 'Google'
                            },
                            properties: {}
                        },
                        {
                            id: new ObjectId().toString(),
                            tool: 'textbox',
                            attributes: { style: 'border: solid 1px #AAAAAA;' },
                            properties: {
                                name: 'text1',
                                validation: 'return true;',
                                success: 1,
                                failure: 0,
                                omit: 0
                            }
                        }
                    ]
                },
                {
                    id: new ObjectId().toString(),
                    style: `background-color: #${Math.random()
                        .toString(16)
                        .substr(2, 6)};`,
                    components: [
                        {
                            id: new ObjectId().toString(),
                            tool: 'label',
                            attributes: {
                                text: 'What is this logo?',
                                style: 'font-family: Georgia, serif;'
                            },
                            properties: {}
                        },
                        {
                            id: new ObjectId().toString(),
                            tool: 'image',
                            attributes: {
                                src: 'http://www.apple.com/logo.png',
                                alt: 'Apple'
                            },
                            properties: {}
                        },
                        {
                            id: new ObjectId().toString(),
                            tool: 'textbox',
                            attributes: { style: 'border: solid 1px #AAAAAA;' },
                            properties: {
                                name: 'text2',
                                validation: 'return true;',
                                success: 1,
                                failure: 0,
                                omit: 0
                            }
                        }
                    ]
                }
            ]
        };
        // let viewModel;

        before(() => {
            const SuperStream = Stream.define({
                _fetchAll() {
                    const that = this;
                    const dfd = $.Deferred();
                    that.pages
                        .fetch()
                        .then(() => {
                            const promises = [];
                            $.each(that.pages.data(), (index, page) => {
                                promises.push(page.components.fetch());
                            });
                            $.when(...promises)
                                .then(dfd.resolve)
                                .catch(dfd.reject);
                        })
                        .catch(dfd.reject);
                    return dfd.promise();
                },
                load() {
                    const that = this;
                    const json =
                        JSON.parse(localStorage.getItem(storageKey)) || {};
                    that.accept(json);
                    return that._fetchAll();
                },
                save() {
                    const that = this;
                    const data = that.toJSON(true);
                    $.each(data.pages, (pageIdx, page) => {
                        // eslint-disable-next-line no-param-reassign
                        page.id = page.id || new ObjectId().toString();
                        $.each(page.components, (componentIdx, component) => {
                            // eslint-disable-next-line no-param-reassign
                            component.id =
                                component.id || new ObjectId().toString();
                        });
                    });
                    localStorage.setItem(storageKey, stringify(data));
                    that.accept(data);
                    return that._fetchAll();
                }
            });

            stream = new SuperStream();
            localStorage.removeItem(storageKey);
            localStorage.setItem(storageKey, JSON.stringify(options));
        });

        it('Reading', done => {
            stream.load().always(() => {
                // expect(stream.isNew()).to.be.false;
                expect(stream.dirty).to.be.false;
                // expect(stream).to.have.property('id', options.id);
                expect(stream)
                    .to.have.property('pages')
                    .that.is.an.instanceof(PageDataSource);
                expect(stream.pages.total()).to.equal(2);
                for (let i = 0; i < stream.pages.total(); i++) {
                    const page = stream.pages.at(i);
                    expect(page.isNew()).to.be.false;
                    expect(page.dirty).to.be.false;
                    expect(page).to.have.property('id', options.pages[i].id);
                    expect(page).to.have.property(
                        'style',
                        options.pages[i].style
                    );
                    for (let j = 0; j < page.components.data(); j++) {
                        const component = page.components.at(j);
                        expect(component.isNew()).to.be.false;
                        expect(component.dirty).to.be.false;
                        expect(component).to.have.property(
                            'id',
                            options.pages[i].components[j].id
                        );
                        expect(component).to.have.property(
                            'tool',
                            options.pages[i].components[j].tool
                        );
                        // TODO: attributes and properties
                    }
                }
                done();
            });
        });

        it('Creating and fetching', done => {
            const index = stream.pages.total();
            stream.pages.add({});
            stream.pages
                .at(index)
                .components.fetch()
                .always(() => {
                    done();
                });
        });

        it('Creating', done => {
            const index = stream.pages.total();
            stream.pages.add({});
            stream.pages.at(index).components.add({ tool: 'label' });
            stream.save().always(() => {
                const update = $.parseJSON(localStorage.getItem(storageKey));
                // expect(update).to.have.property('id', stream.id);
                expect(update)
                    .to.have.property('pages')
                    .that.is.an.instanceof(Array)
                    .with.property('length', index + 1);
                expect(update.pages[index]).to.have.property(
                    'id',
                    stream.pages.at(index).id
                );
                expect(update.pages[index])
                    .to.have.property('components')
                    .that.is.an.instanceof(Array)
                    .with.property(
                        'length',
                        stream.pages.at(index).components.total()
                    );
                // TODO: attributes and properties
                done();
            });
        });

        it('Updating', done => {
            const index = stream.pages.total() - 1;
            stream.pages.at(index).set(
                'style',
                `background-color: #${Math.random()
                    .toString(16)
                    .substr(2, 6)};`
            );
            stream.pages
                .at(index)
                .components.at(0)
                .set('top', 100);
            stream.pages
                .at(index)
                .components.at(0)
                .set('left', 100);
            stream.pages
                .at(index)
                .components.at(0)
                .set('rotate', 45);
            stream.save().always(() => {
                const update = $.parseJSON(localStorage.getItem(storageKey));
                // expect(update).to.have.property('id', stream.id);
                expect(update)
                    .to.have.property('pages')
                    .that.is.an.instanceof(Array)
                    .with.property('length', index + 1);
                expect(update.pages[index]).to.have.property(
                    'id',
                    stream.pages.at(index).id
                );
                expect(update.pages[index]).to.have.property(
                    'style',
                    stream.pages.at(index).style
                );
                expect(update.pages[index].components[0]).to.have.property(
                    'top',
                    stream.pages.at(index).components.at(0).top
                );
                expect(update.pages[index].components[0]).to.have.property(
                    'left',
                    stream.pages.at(index).components.at(0).left
                );
                expect(update.pages[index].components[0]).to.have.property(
                    'rotate',
                    stream.pages.at(index).components.at(0).rotate
                );
                done();
            });
        });

        it('Deleting', done => {
            const index = stream.pages.total() - 1;
            stream.pages.remove(stream.pages.at(index));
            stream.save().always(() => {
                const update = $.parseJSON(localStorage.getItem(storageKey));
                // expect(update).to.have.property('id', stream.id);
                expect(update)
                    .to.have.property('pages')
                    .that.is.an.instanceof(Array)
                    .with.property('length', index);
                done();
            });
        });
    });

    xdescribe('Hierarchy of CRUD transports', () => {
        // See http://docs.telerik.com/kendo-ui/framework/hierarchicaldatasource/overview#binding-a-hierarchicaldatasource-to-remote-data-with-multiple-service-end-points
        describe('Hierarchy of CRUD transports', () => {
            let viewModel;
            const pageSpies = {};
            const componentSpies = {};
            const change = {};

            // Our stream contains one page
            const pageData = [{ id: new ObjectId().toString() }];
            // Our single page contains one component
            const componentData = [
                {
                    id: new ObjectId().toString(),
                    tool: 'label'
                }
            ];

            before(() => {
                const SuperStream = Stream.define({
                    model: {
                        pages: {
                            transport: getSpyingTransport(pageData, pageSpies),
                            schema: normalizeSchema({
                                model: {
                                    components: {
                                        // Note: this basic implementation does not allow
                                        // for a foreign key to relate components to their pages
                                        transport: getSpyingTransport(
                                            componentData,
                                            componentSpies
                                        ),
                                        schema: normalizeSchema()
                                    }
                                }
                            })
                        }
                    }
                });

                const Version = BaseModel.define({
                    id: 'id',
                    fields: {
                        id: {
                            type: 'string',
                            editable: false,
                            nullable: true
                        },
                        stream: {
                            defaultValue: undefined,
                            parse(value) {
                                return value instanceof Stream
                                    ? value
                                    : new SuperStream(value);
                            }
                        }
                    }
                });

                viewModel = observable({
                    version: new Version()
                });
            });

            beforeEach(() => {
                pageSpies.read = sinon.spy();
                pageSpies.create = sinon.spy();
                pageSpies.update = sinon.spy();
                pageSpies.destroy = sinon.spy();

                componentSpies.read = sinon.spy();
                componentSpies.create = sinon.spy();
                componentSpies.update = sinon.spy();
                componentSpies.destroy = sinon.spy();

                change.viewModel = sinon.spy();

                viewModel.unbind('change');
                viewModel.bind('change', e => {
                    change.viewModel(e);
                });
                viewModel.version.stream.unbind('change');
                viewModel.version.stream.bind('change', e => {
                    change.stream(e);
                });
                viewModel.version.stream.pages.unbind('change');
                viewModel.version.stream.pages.bind('change', e => {
                    change.pages(e);
                });
            });

            it('Reading', done => {
                const { stream } = viewModel.version;
                stream.load().always(() => {
                    stream.pages
                        .at(0)
                        .load()
                        .then(
                            tryCatch(done)(() => {
                                expect(pageSpies.read).to.have.been.calledOnce;
                                expect(stream.pages.total()).to.equal(1);
                                expect(componentSpies.read).to.have.been
                                    .calledOnce;
                                expect(
                                    stream.pages.at(0).components.total()
                                ).to.equal(1);
                            })
                        );
                });
            });

            it('Creating', done => {
                const { stream } = viewModel.version;
                expect(stream.pages.total()).to.equal(1);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(2);
                stream.pages.at(1).components.add({ tool: 'label' });
                stream.pages.at(1).components.add({ tool: 'textbox' });
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(3);
                stream.pages.at(2).components.add({ tool: 'label' });
                stream.pages.at(2).components.add({ tool: 'textbox' });
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages
                    .sync()
                    .then(() => {
                        expect(pageSpies.create).to.have.callCount(2);
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(
                            1
                        );
                        expect(stream.pages.at(1).components.total()).to.equal(
                            2
                        );
                        expect(stream.pages.at(2).components.total()).to.equal(
                            2
                        );
                        const promises = [];
                        for (let i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when(...promises).always(() => {
                            expect(componentSpies.create).to.callCount(4);
                            expect(stream.pages.total()).to.equal(3);
                            expect(
                                stream.pages.at(0).components.total()
                            ).to.equal(1);
                            expect(
                                stream.pages.at(1).components.total()
                            ).to.equal(2);
                            expect(
                                stream.pages.at(2).components.total()
                            ).to.equal(2);
                            done();
                        });
                    })
                    .catch(done);
            });

            it('Updating', done => {
                const { stream } = viewModel.version;
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages.at(1).set('style', 'background-color: #FF0000;');
                stream.pages
                    .at(1)
                    .components.at(0)
                    .set('top', 50);
                stream.pages
                    .at(1)
                    .components.at(0)
                    .set('left', 50);
                stream.pages.at(2).set('style', 'background-color: #FF0000;');
                stream.pages
                    .at(2)
                    .components.at(0)
                    .set('top', 50);
                stream.pages
                    .at(2)
                    .components.at(0)
                    .set('left', 50);
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages
                    .sync()
                    .then(() => {
                        expect(pageSpies.update).to.have.callCount(2);
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(
                            1
                        );
                        expect(stream.pages.at(1).components.total()).to.equal(
                            2
                        );
                        expect(stream.pages.at(2).components.total()).to.equal(
                            2
                        );
                        const promises = [];
                        for (let i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when(...promises).always(() => {
                            expect(componentSpies.update).to.callCount(2);
                            expect(stream.pages.total()).to.equal(3);
                            expect(
                                stream.pages.at(0).components.total()
                            ).to.equal(1);
                            expect(
                                stream.pages.at(1).components.total()
                            ).to.equal(2);
                            expect(
                                stream.pages.at(2).components.total()
                            ).to.equal(2);
                            done();
                        });
                    })
                    .catch(done);
            });

            it('Destroying', done => {
                const { stream } = viewModel.version;
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                // Destroying a page on the client might require server code to delete its components
                // because the framework does not call the destroy method on components of removed pageSpies
                stream.pages.remove(stream.pages.at(0));
                stream.pages
                    .at(0)
                    .components.remove(stream.pages.at(0).components.at(0)); // page 1 became page 0
                expect(stream.pages.total()).to.equal(2);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages
                    .sync()
                    .then(() => {
                        expect(pageSpies.destroy).to.have.been.calledOnce;
                        expect(stream.pages.total()).to.equal(2);
                        expect(stream.pages.at(0).components.total()).to.equal(
                            1
                        );
                        expect(stream.pages.at(1).components.total()).to.equal(
                            2
                        );
                        const promises = [];
                        for (let i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when(...promises).always(() => {
                            expect(componentSpies.destroy).to.have.been
                                .calledOnce;
                            expect(stream.pages.total()).to.equal(2);
                            expect(
                                stream.pages.at(0).components.total()
                            ).to.equal(1);
                            expect(
                                stream.pages.at(1).components.total()
                            ).to.equal(2);
                            done();
                        });
                    })
                    .catch(done);
            });
        });

        xdescribe('Same with batch: true', () => {
            let stream;
            let pageSpies;
            let componentSpies;
            /*
            const pageData = [{ id: new ObjectId().toString() }];
            const componentData = [
                {
                    id: new ObjectId().toString(),
                    tool: 'label'
                }
            ];
             */
            before(() => {
                const SuperStream = Stream.define({
                    model: {
                        pages: {
                            transport: {
                                read(options) {
                                    pageSpies.read(options);
                                    // window.console.log('reading pages...');
                                    options.success();
                                },
                                create(options) {
                                    pageSpies.create(options);
                                    // window.console.log('creating pages...');
                                    if ($.isArray(options.data.models)) {
                                        $.each(
                                            options.data.models,
                                            (index, model) => {
                                                // eslint-disable-next-line no-param-reassign
                                                model.id = new ObjectId().toString(); // id set on server
                                            }
                                        );
                                    }
                                    options.success(options.data.models);
                                },
                                update(options) {
                                    pageSpies.update(options);
                                    // window.console.log('updating pages...');
                                    options.success(options.data.models);
                                },
                                destroy(options) {
                                    pageSpies.destroy(options);
                                    // window.console.log('deleting pages...');
                                    options.success(options.data.models);
                                }
                            },
                            batch: true,
                            schema: {
                                model: {
                                    components: {
                                        transport: {
                                            read(options) {
                                                componentSpies.read(options);
                                                // window.console.log('reading componentSpies...');
                                                options.success();
                                            },
                                            create(options) {
                                                componentSpies.create(options);
                                                // window.console.log('creating componentSpies...');
                                                if (
                                                    $.isArray(
                                                        options.data.models
                                                    )
                                                ) {
                                                    $.each(
                                                        options.data.models,
                                                        (index, model) => {
                                                            // eslint-disable-next-line no-param-reassign
                                                            model.id = new ObjectId().toString(); // id set on server
                                                        }
                                                    );
                                                }
                                                options.success(
                                                    options.data.models
                                                );
                                            },
                                            update(options) {
                                                componentSpies.update(options);
                                                // window.console.log('updating componentSpies...');
                                                options.success(
                                                    options.data.models
                                                );
                                            },
                                            destroy(options) {
                                                componentSpies.destroy(options);
                                                // window.console.log('deleting componentSpies...');
                                                options.success(
                                                    options.data.models
                                                );
                                            }
                                        },
                                        batch: true
                                    }
                                }
                            }
                        }
                    }
                });
                stream = new SuperStream();
            });

            beforeEach(() => {
                pageSpies = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };

                componentSpies = {
                    read: sinon.spy(),
                    create: sinon.spy(),
                    update: sinon.spy(),
                    destroy: sinon.spy()
                };
            });

            it('Reading', done => {
                stream.load().always(() => {
                    expect(pageSpies.read).to.have.been.called;
                    expect(componentSpies.read).not.to.have.been.called;
                    expect(stream.pages.total()).to.equal(1);
                    stream.pages
                        .at(0)
                        .load()
                        .always(() => {
                            expect(componentSpies.read).to.have.been.called;
                            expect(
                                stream.pages.at(0).components.total()
                            ).to.equal(1);
                            done();
                        });
                });
            });

            it('Creating', done => {
                expect(stream.pages.total()).to.equal(1);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(2);
                stream.pages.at(1).components.add({ tool: 'label' });
                stream.pages.at(1).components.add({ tool: 'textbox' });
                expect(stream.pages.at(1).components.total()).to.equal(2);
                stream.pages.add({});
                expect(stream.pages.total()).to.equal(3);
                stream.pages.at(2).components.add({ tool: 'label' });
                stream.pages.at(2).components.add({ tool: 'textbox' });
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages
                    .sync()
                    .then(() => {
                        expect(pageSpies.create).to.have.been.calledOnce;
                        expect(stream.pages.total()).to.equal(3);
                        expect(stream.pages.at(0).components.total()).to.equal(
                            1
                        );
                        expect(stream.pages.at(1).components.total()).to.equal(
                            2
                        );
                        expect(stream.pages.at(2).components.total()).to.equal(
                            2
                        );
                        const promises = [];
                        for (let i = 0; i < stream.pages.total(); i++) {
                            promises.push(stream.pages.at(i).components.sync());
                        }
                        $.when(...promises).always(() => {
                            expect(componentSpies.create).to.have.been
                                .calledTwice;
                            expect(stream.pages.total()).to.equal(3);
                            expect(
                                stream.pages.at(0).components.total()
                            ).to.equal(1);
                            expect(
                                stream.pages.at(1).components.total()
                            ).to.equal(2);
                            expect(
                                stream.pages.at(2).components.total()
                            ).to.equal(2);
                            done();
                        });
                    })
                    .catch(done);
            });

            it('Updating', done => {
                stream.pages.at(1).set('style', 'background-color: #FF0000;');
                stream.pages
                    .at(1)
                    .components.at(0)
                    .set('top', 50);
                stream.pages
                    .at(1)
                    .components.at(0)
                    .set('left', 50);
                stream.pages
                    .at(2)
                    .components.at(0)
                    .set('top', 50);
                stream.pages
                    .at(2)
                    .components.at(0)
                    .set('left', 50);
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                const promises = [
                    stream.pages.sync(),
                    stream.pages.at(1).components.sync(),
                    stream.pages.at(2).components.sync()
                ];
                $.when(...promises).always(() => {
                    expect(pageSpies.update).to.have.been.calledOnce;
                    expect(componentSpies.update).to.have.been.calledTwice;
                    done();
                });
            });

            it('Deleting', done => {
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(1).components.total()).to.equal(2);
                expect(stream.pages.at(2).components.total()).to.equal(2);
                stream.pages
                    .at(1)
                    .components.remove(stream.pages.at(1).components.at(1));
                stream.pages
                    .at(2)
                    .components.remove(stream.pages.at(2).components.at(1));
                expect(stream.pages.at(1).components.total()).to.equal(1);
                expect(stream.pages.at(2).components.total()).to.equal(1);
                const promises = [
                    stream.pages.at(1).components.sync(),
                    stream.pages.at(2).components.sync(),
                    stream.pages.sync()
                ];
                $.when(...promises).always(() => {
                    expect(pageSpies.destroy).not.to.have.been.called;
                    expect(componentSpies.destroy).to.have.been.calledTwice;
                    done();
                });
            });
        });

        xdescribe('Same with batch: true and submit method', () => {
            let stream;
            // let pages;
            // let components;
            xit('Mixing operations and saving stream', () => {
                // window.console.log('--------------');
                expect(stream.pages.total()).to.equal(3);
                expect(stream.pages.at(0).components.total()).to.equal(1);
                expect(stream.pages.at(1).components.total()).to.equal(1);
                expect(stream.pages.at(2).components.total()).to.equal(1);
                // page 0
                stream.pages.at(0).set('style', 'border 1px #0000FF;');
                stream.pages
                    .at(0)
                    .components.at(0)
                    .set('rotate', 45);
                stream.pages.at(0).components.add({ tool: 'button' });
                stream.pages
                    .at(0)
                    .components.at(1)
                    .set('top', 120);
                stream.pages
                    .at(0)
                    .components.at(1)
                    .set('left', 120);
                // page 1
                stream.pages.remove(stream.pages.at(1));
                // page 2
                stream.pages.at(1).set('style', 'padding: 10px');
                stream.pages
                    .at(1)
                    .components.remove(stream.pages.at(1).components.at(0));
                stream.pages.at(1).components.add({ tool: 'textbox' });
                stream.pages
                    .at(0)
                    .components.at(0)
                    .set('rotate', 45);
                // TODO
            });
        });
    });
});
