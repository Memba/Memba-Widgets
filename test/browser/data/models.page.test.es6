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
import { getComponentArray, getPage } from '../_misc/test.components.es6';
// import CONSTANTS from '../../../src/js/common/window.constants.es6';
import PageComponentDataSource from '../../../src/js/data/datasources.pagecomponent.es6';
import Page from '../../../src/js/data/models.page.es6';

// Load tools
// import '../../../src/js/tools/tools.image.es6';
import '../../../src/js/tools/tools.label.es6';
// import '../../../src/js/tools/tools.textbox.es6';

const { describe, it, xit } = window;
const {
    data: { DataSource }
} = window.kendo;
const { expect } = chai;
chai.use(sinonChai);

describe('models.page', () => {
    describe('Page', () => {
        describe('Initialization', () => {
            it('It should initialize without options', done => {
                // Unfortunately, this is a Kendo UI requirement
                const page = new Page();
                expect(page)
                    .to.have.property('components')
                    .that.is.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(page.components).to.respondTo('fetch');
                page.components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(page.components.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('It should initialize from a dummy object', done => {
                const options = JSC.object()();
                const prop = Object.keys(options)[0];
                const page = new Page(options);
                expect(page)
                    .to.have.property('components')
                    .that.is.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(page[prop]).to.be.undefined;
                page.components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(page.components.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            it('if should initialize with an array of bare components', done => {
                const data = getComponentArray();
                const options = {
                    components: data.map(item => ({
                        tool: item.tool
                    }))
                };
                const page = new Page(options);
                expect(page)
                    .to.have.property('components')
                    .that.is.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(page.components).to.respondTo('fetch');
                page.components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(page.components.total()).to.equal(
                                data.length
                            );
                            page.components
                                .data()
                                .forEach((component, index) => {
                                    assertBaseModel(
                                        component,
                                        Object.assign(
                                            {},
                                            component.defaults,
                                            {
                                                attributes:
                                                    component.attributes
                                                        .defaults,
                                                properties:
                                                    component.properties
                                                        .defaults
                                            },
                                            options.components[index]
                                        )
                                    );
                                });
                        })
                    )
                    .catch(done);
            });

            it('if should initialize with an array of components', done => {
                const data = getComponentArray();
                const options = {
                    components: data
                };
                const page = new Page(options);
                expect(page)
                    .to.have.property('components')
                    .that.is.an.instanceof(PageComponentDataSource);
                expect(page).to.have.property('id').that.is.null;
                expect(page).to.have.property('explanations', '');
                expect(page).to.have.property('instructions', '');
                expect(page).to.have.property('style', '');
                expect(page).to.have.property('time', 30);
                expect(page.components).to.respondTo('fetch');
                page.components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            expect(page.components.total()).to.equal(
                                data.length
                            );
                            page.components
                                .data()
                                .forEach((component, index) => {
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

        describe('assets', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('stream', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('index', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('Clone', () => {
            it('It should clone any page', done => {
                const options = getPage();
                const page = new Page(options);
                expect(page)
                    .to.have.property('components')
                    .that.is.an.instanceof(PageComponentDataSource);
                page.components
                    .fetch()
                    .then(
                        tryCatch(done)(() => {
                            assertBaseModel(page, options);
                            const clone = page.clone();
                            // Clean options
                            options.id = null;
                            options.components.forEach(component => {
                                /* eslint-disable no-param-reassign */
                                component.id = null;
                                // TODO also change name and remove question/solution/validation
                                /* eslint-enable no-param-reassign */
                            });
                            assertBaseModel(clone, options);
                        })
                    )
                    .catch(done);
            });
        });

        describe('Validation', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('toJSON', () => {
            it('It should save to JSON', () => {
                expect(true).to.be.false;
                // TODO: test default values are undefined
            });
        });

        describe('Events', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });
    });
});
