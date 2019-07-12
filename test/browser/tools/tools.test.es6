/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
import JSC from 'jscheck';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';
import { tryCatch } from '../_misc/test.util.es6';
import tools from '../../../src/js/tools/tools.es6';
import { BaseTool } from '../../../src/js/tools/tools.base.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import PointerTool from '../../../src/js/tools/tools.pointer.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';

const { describe, it } = window;
const { Observable } = window.kendo;
const { expect } = chai;
const DATA = ['image', 'label', 'textbox'];

describe('tools', () => {
    describe('Initializing', () => {
        it('it should be an Observable', () => {
            expect(tools).to.be.an.instanceof(Observable);
            expect(tools).to.have.property(TOOLS.ACTIVE);
            expect(tools).to.have.property(TOOLS.POINTER);
            expect(tools).to.respondTo('load');
        });

        it('it should at least have a pointer, a label, a textbox and an image tool', () => {
            expect(tools)
                .to.have.property(TOOLS.POINTER)
                .that.is.an.instanceof(PointerTool);
            expect(tools).to.have.property(TOOLS.ACTIVE, TOOLS.POINTER);
            DATA.forEach(id => {
                expect(tools)
                    .to.have.property(id)
                    .that.is.an.instanceof(Observable);
            });
        });
    });

    describe('Loading tools', () => {
        it('it should throw when loading a tool that is not designated by a string id', () => {
            const id = JSC.one_of([
                undefined,
                null,
                JSC.boolean(),
                JSC.number(),
                JSC.object(),
                JSC.array()
            ])();
            function fn() {
                tools.load(id);
            }
            expect(fn).to.throw();
        });

        it('it should reject when loading a tool that is designated by an unknown string id', done => {
            const id = JSC.one_of([
                '_events',
                '_handlers',
                'load',
                TOOLS.ACTIVE,
                JSC.string()()
            ])();
            expect(tools[id]).not.to.be.an.instanceof(Observable);
            expect(tools[id]).not.to.be.an.instanceof(BaseTool);
            tools
                .load('id')
                .then(() => {
                    done(new Error(`It should not have loaded tool ${id}`));
                })
                .catch(err => {
                    expect(err).to.be.an.instanceof(Error);
                    done();
                });
        });

        it('it should load a tool with a known id', done => {
            function test(id) {
                const dfd = $.Deferred();
                expect(tools[id]).to.be.an.instanceof(Observable);
                expect(tools[id]).not.to.be.an.instanceof(BaseTool);
                tools
                    .load(id)
                    .then(
                        tryCatch(dfd)(() => {
                            expect(tools[id]).to.be.an.instanceof(BaseTool);
                        })
                    )
                    .catch(dfd.reject);
                return dfd.promise();
            }
            const promises = DATA.map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('it should reload a tool with a known id', done => {
            function test(id) {
                const dfd = $.Deferred();
                expect(tools[id]).not.to.be.an.instanceof(Observable);
                expect(tools[id]).to.be.an.instanceof(BaseTool);
                tools
                    .load(id)
                    .then(
                        tryCatch(dfd)(() => {
                            expect(tools[id]).to.be.an.instanceof(BaseTool);
                        })
                    )
                    .catch(dfd.reject);
                return dfd.promise();
            }
            const promises = DATA.map(test);
            $.when(...promises)
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });
});
