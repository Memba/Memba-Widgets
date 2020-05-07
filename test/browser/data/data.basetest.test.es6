/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.binder';
import chai from 'chai';
import JSC from 'jscheck';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/data.base.es6';
import BaseTest from '../../../src/js/data/data.basetest.es6';
import Stream from '../../../src/js/data/data.stream.es6';
import tools from '../../../src/js/tools/tools.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import { tryCatch } from '../_misc/test.util.es6';
import {
    componentGenerator,
    getStream,
} from '../../../src/js/helpers/helpers.components.es6';

const { describe, it, xit } = window;
const {
    data: { ObservableArray },
    // observable
} = window.kendo;
const { expect } = chai;
// chai.use(sinonChai);

function getTestModel() {
    const dfd = $.Deferred();
    const options = getStream();
    const stream = new Stream(options);
    const { pages } = stream;
    pages
        .fetch()
        .then(() => {
            const promises = pages
                .data()
                .map((page) => page.components.fetch());
            $.when(...promises)
                .then(() => {
                    dfd.resolve(stream.getTestModel());
                })
                .catch(dfd.reject);
        })
        .catch(dfd.reject);
    return dfd.promise();
}

function assertBaseTest(test) {
    expect(test).to.be.an.instanceof(BaseModel);
    expect(test)
        .to.have.property('interactions')
        .that.is.an.instanceof(ObservableArray);
    expect(test).to.respondTo('getScoreTable');
    expect(test).to.respondTo('grade');
    expect(test).to.respondTo('max');
    expect(test).to.respondTo('percent');
    expect(test).to.respondTo('score');
    expect(test).to.respondTo('toJSON');
    Object.keys(test).forEach((key) => {
        if (TOOLS.RX_TEST_FIELD_NAME.test(key)) {
            expect(test).to.have.nested.property(`${key}.result`);
            expect(test).to.have.nested.property(`${key}.score`);
            expect(test).to.have.nested.property(`${key}.value`);
            // expect(test).to.have.nested.property(`${key}.pageIdx`);
        }
    });
}

describe('data.basetest', () => {
    before((done) => {
        const promises = Object.keys(componentGenerator).map((tool) =>
            tools.load(tool)
        );
        $.when(...promises)
            .then(done)
            .catch(done);
    });

    describe('BaseTest', () => {
        describe('Initialization', () => {
            it('It should initialize without options', () => {
                const test = new BaseTest();
                assertBaseTest(test);
            });

            it('It should initialize from stream', (done) => {
                getTestModel()
                    .then(
                        tryCatch(done)((TestModel) => {
                            const test = new TestModel();
                            assertBaseTest(test);
                        })
                    )
                    .catch(done);
            });
        });

        describe('getScoreTable', () => {
            it('It should initialize from stream', (done) => {
                getTestModel()
                    .then(
                        tryCatch(done)((TestModel) => {
                            const test = new TestModel();
                            const table = test.getScoreTable();
                            const keys = Object.keys(test.fields).filter(
                                (key) =>
                                    TOOLS.RX_TEST_FIELD_NAME.test(key) &&
                                    !test[key]
                                        .component()
                                        .get('properties.disabled')
                            );
                            expect(table)
                                .to.be.an(CONSTANTS.ARRAY)
                                .with.lengthOf(keys.length);
                            table.forEach((scoreLine) => {
                                expect(scoreLine).to.have.property('name');
                                expect(scoreLine).to.have.property('pageIdx');
                                expect(scoreLine).to.have.property('question');
                                // TODO expect(scoreLine).to.have.property('result');
                                // TODO expect(scoreLine).to.have.property('score');
                                expect(scoreLine).to.have.property('solution');
                                expect(scoreLine).to.have.property('value');
                            });
                        })
                    )
                    .catch(done);
            });
        });

        describe('grade', () => {
            it('Grade all pages', (done) => {
                getTestModel()
                    .then((TestModel) => {
                        const test = new TestModel();
                        // Set the value of each field to the solution
                        Object.keys(test.fields).forEach((key) => {
                            if (TOOLS.RX_TEST_FIELD_NAME.test(key)) {
                                const field = test[key];
                                const component = field.component();
                                if (!component.get('properties.disabled')) {
                                    const solution = component.get(
                                        'properties.solution'
                                    );
                                    field.set('value', solution);
                                }
                            }
                        });
                        // Now grade the test
                        test.grade()
                            .then(
                                tryCatch(done)(() => {
                                    Object.keys(test.fields).forEach((key) => {
                                        if (
                                            TOOLS.RX_TEST_FIELD_NAME.test(key)
                                        ) {
                                            const field = test[key];
                                            const component = field.component();
                                            if (
                                                !component.get(
                                                    'properties.disabled'
                                                )
                                            ) {
                                                expect(field.get('result')).to
                                                    .be.true;
                                                expect(
                                                    field.get('score')
                                                ).to.equal(
                                                    component.get(
                                                        'properties.success'
                                                    )
                                                );
                                            }
                                        }
                                    });
                                })
                            )
                            .catch(done);
                    })
                    .catch(done);
            });

            it('Grade a single page', (done) => {
                getTestModel()
                    .then((TestModel) => {
                        const test = new TestModel();
                        const indexes = [];
                        // Set the value of each field to the solution
                        // also collect page indexes in the same iteration
                        Object.keys(test.fields).forEach((key) => {
                            if (TOOLS.RX_TEST_FIELD_NAME.test(key)) {
                                const field = test[key];
                                const component = field.component();
                                if (!component.get('properties.disabled')) {
                                    const solution = component.get(
                                        'properties.solution'
                                    );
                                    field.set('value', solution);
                                    const index = field.page().index();
                                    if (indexes.indexOf(index) === -1) {
                                        indexes.push(index);
                                    }
                                }
                            }
                        });
                        // Get a random page
                        const pageIdx = JSC.one_of(indexes)();
                        // Now grade the test page
                        test.grade(pageIdx)
                            .then(
                                tryCatch(done)(() => {
                                    Object.keys(test.fields).forEach((key) => {
                                        if (
                                            TOOLS.RX_TEST_FIELD_NAME.test(key)
                                        ) {
                                            const field = test[key];
                                            const component = field.component();
                                            if (
                                                !component.get(
                                                    'properties.disabled'
                                                )
                                            ) {
                                                if (
                                                    field.page().index() ===
                                                    pageIdx
                                                ) {
                                                    expect(field.get('result'))
                                                        .to.be.true;
                                                    expect(
                                                        field.get('score')
                                                    ).to.equal(
                                                        component.get(
                                                            'properties.success'
                                                        )
                                                    );
                                                } else {
                                                    expect(field.get('result'))
                                                        .to.be.null;
                                                    expect(
                                                        field.get('score')
                                                    ).to.equal(
                                                        component.get(
                                                            'properties.omit'
                                                        )
                                                    );
                                                }
                                            }
                                        }
                                    });
                                })
                            )
                            .catch(done);
                    })
                    .catch(done);
            });
        });

        describe('max', () => {
            it('It should compute the max score', (done) => {
                getTestModel()
                    .then(
                        tryCatch(done)((TestModel) => {
                            const test = new TestModel();
                            const max = test.max();
                            let success = 0;
                            Object.keys(test.fields).forEach((key) => {
                                if (TOOLS.RX_TEST_FIELD_NAME.test(key)) {
                                    const field = test[key];
                                    const component = field.component();
                                    if (!component.get('properties.disabled')) {
                                        success +=
                                            component.get(
                                                'properties.success'
                                            ) || 0;
                                    }
                                }
                            });
                            expect(max).to.equal(success);
                        })
                    )
                    .catch(done);
            });
        });

        xdescribe('percent', () => {
            it('It should compute the score as a percentage of the max score', (done) => {
                getTestModel()
                    .then(
                        tryCatch(done)((TestModel) => {
                            const test = new TestModel();
                            expect(test).to.be.an.instanceof(TestModel);
                        })
                    )
                    .catch(done);
            });
        });

        xdescribe('score', () => {
            it('It should compute the score', (done) => {
                getTestModel()
                    .then(
                        tryCatch(done)((TestModel) => {
                            const test = new TestModel();
                            expect(test).to.be.an.instanceof(TestModel);
                        })
                    )
                    .catch(done);
            });
        });

        describe('toJSON', () => {
            xit('It should return a JSON object', (done) => {
                done();
            });
        });
    });
});
