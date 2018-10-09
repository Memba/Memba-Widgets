/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Validation: cannot change id and tool
// TODO Add image and textbox
// TODO Add a more complex tool with array attribues or properties

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { assertBaseModel } from '../_misc/test.util.es6';
import { getComponentArray } from '../_misc/test.components.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseModel from '../../../src/js/data/models.base.es6';
// import Page from '../../../src/js/data/models.page.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';

// Load tools
// import '../../../src/js/tools/tools.image.es6';
import '../../../src/js/tools/tools.label.es6';
// import '../../../src/js/tools/tools.textbox.es6';

const { describe, it } = window;
const {
    data: { Model }
} = window.kendo;
const { expect } = chai;
chai.use(sinonChai);

describe('models.pagecomponent', () => {
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

            it('It should fail to initialize a PageComponent with invalid options', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent(JSC.object()());
                }
                expect(test).to.throw(Error);
            });

            it('It should fail to initialize a PageComponent with a POINTER', () => {
                function test() {
                    // eslint-disable-next-line no-unused-vars
                    const component = new PageComponent({
                        tool: CONSTANTS.POINTER
                    });
                }
                expect(test).to.throw(Error);
            });

            it('It should fail to initialize a PageComponent with an unknown tool', () => {
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
                    assertBaseModel(
                        component,
                        Object.assign(
                            {},
                            component.defaults,
                            {
                                attributes: component.attributes.defaults,
                                properties: component.properties.defaults
                            },
                            options
                        )
                    );
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
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('page', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
            });
        });

        describe('index', () => {
            xit('TODO', () => {
                expect(true).to.be.false;
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

        describe('Clone', () => {
            it('It should clone any component', () => {
                function test(options) {
                    const component = new PageComponent(options);
                    const json = component.toJSON();
                    const clone = component.clone();
                    expect(clone).to.be.an.instanceof(PageComponent);
                    expect(clone).to.be.an.instanceof(BaseModel);
                    expect(clone).to.be.an.instanceof(Model);
                    const result = clone.toJSON();
                    delete json.id;
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
});
